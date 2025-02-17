/// Module: sui_counter
module sui_counter::sui_counter{
  use sui::clock::{Self, Clock};
  use sui::balance::{Self, Balance};
  use sui::coin::{Self, Coin};
  use sui::sui::SUI;

  // Error codes
  const EInsufficientBalance: u64 = 1;
  const ENoUlockTime: u64 = 2;
  const EFundsStillLocked: u64 = 3;

/*
public struct Counter has key {
  id: UID,
  owner: address,
  timestamp: u64
}
*/

public struct Locker has key, store {
  id: UID,
  owner: address,
  lock_till_timestamp: u64,
  balance: u64,
  native_balance: Balance<SUI>
}

#[allow(lint(self_transfer))]
public fun create_locker(coin: Coin<SUI>, clock: &Clock, lock_in_miliseconds: u64, ctx: &mut TxContext) {

  assert!(coin::value(&coin) > 0, EInsufficientBalance);
  //assert!(lock_in_miliseconds > 0, ENoUlockTime);

  let mut locker = Locker {
    id: object::new(ctx),
    owner: ctx.sender(),
    lock_till_timestamp: clock::timestamp_ms(clock) + lock_in_miliseconds,
    balance: coin::value(&coin),
    native_balance: balance::zero()
  };

  balance::join(&mut locker.native_balance, coin::into_balance(coin));

  transfer::transfer(locker, ctx.sender());
}

public fun deposit(coin: Coin<SUI>, locker: &mut Locker, _ctx: &mut TxContext){
  // Add the coin to the vault's balance
  locker.balance = locker.balance + coin::value(&coin); 
  balance::join(&mut locker.native_balance, coin::into_balance(coin));
}

public fun withdraw_all(locker: &mut Locker, clock: &Clock, ctx: &mut TxContext){
  assert!(clock::timestamp_ms(clock) >= locker.lock_till_timestamp, EFundsStillLocked); // Funds are still locked

  let amount = balance::value(&locker.native_balance);
  assert!(amount > 0, EInsufficientBalance);
  locker.balance = 0;
  let coin = coin::take(&mut locker.native_balance, amount, ctx);

  // Transfer the coin to the recipient
  transfer::public_transfer(coin, ctx.sender());
}
/*
public fun create(ctx: &mut TxContext) {
  transfer::share_object(Counter {
    id: object::new(ctx),
    owner: ctx.sender(),
    timestamp: ctx.epoch_timestamp_ms()
  })
}

public fun increment(counter: &mut Counter, clock: &Clock) {
  counter.timestamp = clock::timestamp_ms(clock);
}

public fun set_value(counter: &mut Counter, value: u64, ctx: &TxContext) {
  assert!(counter.owner == ctx.sender(), 0);
  counter.timestamp = value;

}
*/
}